@extends('pdf.layout')

@section('title', 'System Summary Report')

@section('meta-info')
    @if(isset($start_date) && isset($end_date))
        <p><strong>Period:</strong> {{ $start_date }} to {{ $end_date }}</p>
    @else
        <p><strong>Period:</strong> All Time</p>
    @endif
@endsection

@section('content')
    <div class="summary-card">
        <h3>System Overview</h3>
        <table>
            <tbody>
                <tr>
                    <td><strong>Total Suppliers</strong></td>
                    <td class="text-right">{{ $data['totalSuppliers'] ?? 0 }}</td>
                    <td><strong>Active Suppliers</strong></td>
                    <td class="text-right">{{ $data['activeSuppliers'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>Total Products</strong></td>
                    <td class="text-right">{{ $data['totalProducts'] ?? 0 }}</td>
                    <td><strong>Active Products</strong></td>
                    <td class="text-right">{{ $data['activeProducts'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>Total Collections</strong></td>
                    <td class="text-right">{{ $data['totalCollections'] ?? 0 }}</td>
                    <td><strong>Total Payments</strong></td>
                    <td class="text-right">{{ $data['totalPayments'] ?? 0 }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="summary-card">
        <h3>Financial Summary</h3>
        <table>
            <tbody>
                <tr>
                    <td><strong>Total Collections Amount</strong></td>
                    <td class="text-right text-primary">${{ number_format($data['totalCollectionAmount'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Payments Amount</strong></td>
                    <td class="text-right text-success">${{ number_format($data['totalPaymentAmount'] ?? 0, 2) }}</td>
                </tr>
                <tr style="background-color: #e9ecef;">
                    <td><strong>Outstanding Balance</strong></td>
                    <td class="text-right {{ ($data['outstandingBalance'] ?? 0) > 0 ? 'text-danger' : 'text-success' }}">
                        <strong>${{ number_format(abs($data['outstandingBalance'] ?? 0), 2) }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="summary-card">
        <h3>This Month</h3>
        <table>
            <tbody>
                <tr>
                    <td><strong>Collections This Month</strong></td>
                    <td class="text-right">{{ $data['collectionsThisMonth'] ?? 0 }}</td>
                    <td><strong>Collection Amount</strong></td>
                    <td class="text-right">${{ number_format($data['collectionAmountThisMonth'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Payments This Month</strong></td>
                    <td class="text-right">{{ $data['paymentsThisMonth'] ?? 0 }}</td>
                    <td><strong>Payment Amount</strong></td>
                    <td class="text-right">${{ number_format($data['paymentAmountThisMonth'] ?? 0, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
@endsection
