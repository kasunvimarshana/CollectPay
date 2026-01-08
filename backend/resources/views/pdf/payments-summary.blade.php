@extends('pdf.layout')

@section('title', 'Payments Summary Report')

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
                    <td><strong>Total Payments</strong></td>
                    <td class="text-right">{{ $data['summary']['total_count'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>Total Amount</strong></td>
                    <td class="text-right text-success">
                        <strong>{{ number_format($data['summary']['total_amount'] ?? 0, 2) }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    @if (isset($data['by_type']) && count($data['by_type']) > 0)
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Payments by Type</h3>
        <table>
            <thead>
                <tr>
                    <th>Payment Type</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($data['by_type'] as $type)
                    <tr>
                        <td style="text-transform: capitalize;">{{ $type['type'] }}</td>
                        <td class="text-right">{{ $type['count'] }}</td>
                        <td class="text-right">{{ number_format($type['total_amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if (isset($data['by_supplier']) && count($data['by_supplier']) > 0)
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Payments by Supplier</h3>
        <table>
            <thead>
                <tr>
                    <th>Supplier Code</th>
                    <th>Supplier Name</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($data['by_supplier'] as $supplier)
                    <tr>
                        <td>{{ $supplier['supplier_code'] }}</td>
                        <td>{{ $supplier['supplier_name'] }}</td>
                        <td class="text-right">{{ $supplier['count'] }}</td>
                        <td class="text-right">{{ number_format($supplier['total_amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
@endsection
