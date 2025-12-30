<?php

namespace App\Http\Controllers\Api;

use App\Application\DTOs\PaymentDTO;
use App\Application\UseCases\Payment\CalculateBalanceUseCase;
use App\Application\UseCases\Payment\CreatePaymentUseCase;
use App\Application\UseCases\Payment\DeletePaymentUseCase;
use App\Application\UseCases\Payment\GetPaymentUseCase;
use App\Application\UseCases\Payment\ListPaymentsUseCase;
use App\Application\UseCases\Payment\UpdatePaymentUseCase;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    private PaymentRepositoryInterface $paymentRepository;

    private SupplierRepositoryInterface $supplierRepository;

    private CollectionRepositoryInterface $collectionRepository;

    private AuditServiceInterface $auditService;

    public function __construct(
        PaymentRepositoryInterface $paymentRepository,
        SupplierRepositoryInterface $supplierRepository,
        CollectionRepositoryInterface $collectionRepository,
        AuditServiceInterface $auditService
    ) {
        $this->paymentRepository = $paymentRepository;
        $this->supplierRepository = $supplierRepository;
        $this->collectionRepository = $collectionRepository;
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        try {
            $useCase = new ListPaymentsUseCase($this->paymentRepository);

            $filters = [
                'supplier_id' => $request->get('supplier_id'),
                'payment_type' => $request->get('payment_type'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ];

            $filters = array_filter($filters, fn ($value) => $value !== null);

            $result = $useCase->execute($filters, $request->get('page', 1), $request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => array_map(fn ($entity) => $entity->toArray(), $result['data']),
                    'total' => $result['total'],
                    'current_page' => $result['page'],
                    'per_page' => $result['per_page'],
                    'last_page' => $result['last_page'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve payments', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_type' => 'required|in:advance,partial,final,adjustment',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $dto = PaymentDTO::fromArray([
                'supplier_id' => $request->supplier_id,
                'amount' => $request->amount,
                'payment_type' => $request->payment_type,
                'payment_date' => $request->payment_date,
                'recorded_by' => auth()->id(),
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'metadata' => $request->metadata ?? [],
            ]);

            $useCase = new CreatePaymentUseCase($this->paymentRepository, $this->supplierRepository);
            $payment = $useCase->execute($dto);

            $this->auditService->log('create', 'Payment', $payment->getId(), null, $payment->toArray(), 'Payment created', auth()->id());

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Payment created successfully', 'data' => $payment->toArray()], 201);
        } catch (\InvalidArgumentException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => 'Failed to create payment', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $useCase = new GetPaymentUseCase($this->paymentRepository);
            $payment = $useCase->execute($id);

            return response()->json(['success' => true, 'data' => $payment->toArray()]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve payment', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'sometimes|required|date',
            'payment_type' => 'sometimes|required|in:advance,partial,final,adjustment',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $existing = $this->paymentRepository->findById($id);
            if (! $existing) {
                return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
            }

            $dto = PaymentDTO::fromArray([
                'supplier_id' => $request->get('supplier_id', $existing->getSupplierId()),
                'amount' => $request->get('amount', $existing->getAmount()),
                'payment_type' => $request->get('payment_type', $existing->getPaymentType()),
                'payment_date' => $request->get('payment_date', $existing->getPaymentDate()->format('Y-m-d')),
                'recorded_by' => $existing->getRecordedBy(),
                'payment_method' => $request->get('payment_method', $existing->getPaymentMethod()),
                'reference_number' => $request->get('reference_number', $existing->getReferenceNumber()),
                'notes' => $request->get('notes', $existing->getNotes()),
                'metadata' => $request->get('metadata', $existing->getMetadata()),
                'id' => $id,
                'version' => $request->version,
            ]);

            $useCase = new UpdatePaymentUseCase($this->paymentRepository);
            $payment = $useCase->execute($id, $dto);

            $this->auditService->log('update', 'Payment', $payment->getId(), $existing->toArray(), $payment->toArray(), 'Payment updated', auth()->id());

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Payment updated successfully', 'data' => $payment->toArray()]);
        } catch (\InvalidArgumentException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 409);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => 'Failed to update payment', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $useCase = new GetPaymentUseCase($this->paymentRepository);
            $payment = $useCase->execute($id);
            $oldData = $payment->toArray();

            $deleteUseCase = new DeletePaymentUseCase($this->paymentRepository);
            $deleteUseCase->execute($id);

            $this->auditService->log('delete', 'Payment', $id, $oldData, null, 'Payment deleted', auth()->id());

            return response()->json(['success' => true, 'message' => 'Payment deleted successfully']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete payment', 'error' => $e->getMessage()], 500);
        }
    }

    public function bySupplier($supplierId)
    {
        try {
            $payments = $this->paymentRepository->findBySupplier($supplierId);

            return response()->json(['success' => true, 'data' => array_map(fn ($p) => $p->toArray(), $payments)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve payments', 'error' => $e->getMessage()], 500);
        }
    }

    public function calculate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $supplier = $this->supplierRepository->findById($request->supplier_id);
            if (! $supplier) {
                return response()->json(['success' => false, 'message' => 'Supplier not found'], 404);
            }

            $fromDate = $request->from_date ? new \DateTime($request->from_date) : null;
            $toDate = $request->to_date ? new \DateTime($request->to_date) : null;

            $useCase = new CalculateBalanceUseCase($this->collectionRepository, $this->paymentRepository);
            $balance = $useCase->execute($request->supplier_id, $fromDate, $toDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier_id' => $supplier->getId(),
                    'supplier_name' => $supplier->getName(),
                    'from_date' => $request->from_date,
                    'to_date' => $request->to_date,
                    'total_collections' => $balance['total_collections'],
                    'total_payments' => $balance['total_payments'],
                    'outstanding_balance' => $balance['outstanding_balance'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to calculate balance', 'error' => $e->getMessage()], 500);
        }
    }
}
