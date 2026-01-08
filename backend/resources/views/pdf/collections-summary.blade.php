@extends('pdf.layout')

@section('title', 'Collections Summary Report')

@section('meta-info')
    @if (isset($start_date) && isset($end_date))
        <p><strong>Period:</strong> {{ $start_date }} to {{ $end_date }}</p>
    @else
        <p><strong>Period:</strong> All Time</p>
    @endif
@endsection

@section('content')
    <div class="summary-card">
        <h3>Overall Summary</h3>
        <table>
            <tbody>
                <tr>
                    <td><strong>Total Collections</strong></td>
                    <td class="text-right">{{ $data['summary']['total_count'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>Total Quantity</strong></td>
                    <td class="text-right">{{ number_format($data['summary']['total_quantity'] ?? 0, 3) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Amount</strong></td>
                    <td class="text-right text-primary">
                        <strong>{{ number_format($data['summary']['total_amount'] ?? 0, 2) }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    @if (isset($data['by_product']) && count($data['by_product']) > 0)
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Collections by Product</h3>
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($data['by_product'] as $product)
                    <tr>
                        <td>{{ $product['product_name'] }}</td>
                        <td class="text-right">{{ $product['count'] }}</td>
                        <td class="text-right">{{ number_format($product['total_quantity'], 3) }}</td>
                        <td class="text-right">{{ number_format($product['total_amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if (isset($data['by_supplier']) && count($data['by_supplier']) > 0)
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Collections by Supplier</h3>
        <table>
            <thead>
                <tr>
                    <th>Supplier Code</th>
                    <th>Supplier Name</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($data['by_supplier'] as $supplier)
                    <tr>
                        <td>{{ $supplier['supplier_code'] }}</td>
                        <td>{{ $supplier['supplier_name'] }}</td>
                        <td class="text-right">{{ $supplier['count'] }}</td>
                        <td class="text-right">{{ number_format($supplier['total_quantity'], 3) }}</td>
                        <td class="text-right">{{ number_format($supplier['total_amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
@endsection
