@extends('pdf.layout')

@section('title', 'Product Performance Report')

@section('meta-info')
    @if (isset($start_date) && isset($end_date))
        <p><strong>Period:</strong> {{ $start_date }} to {{ $end_date }}</p>
    @else
        <p><strong>Period:</strong> All Time</p>
    @endif
    <p><strong>Total Products:</strong> {{ count($products) }}</p>
@endsection

@section('content')
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product Code</th>
                <th>Product Name</th>
                <th class="text-right">Collections</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Suppliers</th>
                <th class="text-right">Avg Rate</th>
            </tr>
        </thead>
        <tbody>
            @forelse($products as $index => $product)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $product['product_code'] }}</td>
                    <td>{{ $product['product_name'] }}</td>
                    <td class="text-right">{{ $product['collection_count'] }}</td>
                    <td class="text-right">{{ number_format($product['total_quantity'], 3) }}</td>
                    <td class="text-right">{{ number_format($product['total_amount'], 2) }}</td>
                    <td class="text-right">{{ $product['unique_suppliers'] }}</td>
                    <td class="text-right">{{ number_format($product['avg_rate'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center">No product data available</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
