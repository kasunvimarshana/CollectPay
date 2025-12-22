<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CollectionSchedule;
use Illuminate\Http\Request;

class SchedulesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(CollectionSchedule::class, 'schedule');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return CollectionSchedule::query()->orderByDesc('created_at')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:daily,weekly,monthly,custom',
            'custom_cron' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        $schedule = CollectionSchedule::create($data);
        return response()->json($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CollectionSchedule $schedule)
    {
        return $schedule;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CollectionSchedule $schedule)
    {
        $data = $request->validate([
            'type' => 'sometimes|in:daily,weekly,monthly,custom',
            'custom_cron' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        $schedule->update($data);
        return $schedule;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CollectionSchedule $schedule)
    {
        $schedule->delete();
        return response()->noContent();
    }
}
