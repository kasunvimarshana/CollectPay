@extends('pdf.layout')

@section('title', 'Supplier Balances Report')

@section('meta-info')
    @if (isset($start_date) && isset($end_date))
        <p><strong>Period:</strong> {{ $start_date }} to {{ $end_date }}</p>
    @else
        <p><strong>Period:</strong> All Time</p>
    @endif
    <p><strong>Total Suppliers:</strong> {{ count($balances) }}</p>
@endsection

@section('content')
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Supplier Code</th>
                <th>Supplier Name</th>
                <th class="text-right">Collections</th>
                <th class="text-right">Payments</th>
                <th class="text-right">Balance</th>
            </tr>
        </thead>
        <tbody>
            @forelse($balances as $index => $balance)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $balance['supplier_code'] }}</td>
                    <td>{{ $balance['supplier_name'] }}</td>
                    <td class="text-right">{{ number_format($balance['total_collections'], 2) }}</td>
                    <td class="text-right">{{ number_format($balance['total_payments'], 2) }}</td>
                    <td class="text-right {{ $balance['balance'] > 0 ? 'text-danger' : 'text-success' }}">
                        {{ number_format(abs($balance['balance']), 2) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center">No supplier data available</td>
                </tr>
            @endforelse

            @if (count($balances) > 0)
                <tr style="background-color: #e9ecef; font-weight: bold;">
                    <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                    <td class="text-right">{{ number_format(array_sum(array_column($balances, 'total_collections')), 2) }}
                    </td>
                    <td class="text-right">{{ number_format(array_sum(array_column($balances, 'total_payments')), 2) }}
                    </td>
                    <td
                        class="text-right {{ array_sum(array_column($balances, 'balance')) > 0 ? 'text-danger' : 'text-success' }}">
                        {{ number_format(abs(array_sum(array_column($balances, 'balance'))), 2) }}
                    </td>
                </tr>
            @endif
        </tbody>
    </table>
@endsection
