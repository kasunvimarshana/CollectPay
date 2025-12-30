@extends('pdf.layout')

@section('title', 'Financial Summary Report')

@section('meta-info')
    @if(isset($start_date) && isset($end_date))
        <p><strong>Period:</strong> {{ $start_date }} to {{ $end_date }}</p>
    @else
        <p><strong>Period:</strong> All Time</p>
    @endif
@endsection

@section('content')
    <div class="summary-card">
        <h3>Financial Overview</h3>
        <table>
            <tbody>
                <tr>
                    <td><strong>Total Collections</strong></td>
                    <td class="text-right text-primary"><strong>${{ number_format($data['summary']['total_collections'] ?? 0, 2) }}</strong></td>
                </tr>
                <tr>
                    <td><strong>Total Payments</strong></td>
                    <td class="text-right text-success"><strong>${{ number_format($data['summary']['total_payments'] ?? 0, 2) }}</strong></td>
                </tr>
                <tr style="background-color: #e9ecef;">
                    <td><strong>Net Balance</strong></td>
                    <td class="text-right {{ ($data['summary']['net_balance'] ?? 0) > 0 ? 'text-danger' : 'text-success' }}">
                        <strong>${{ number_format(abs($data['summary']['net_balance'] ?? 0), 2) }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    @if(isset($data['monthly_breakdown']) && count($data['monthly_breakdown']) > 0)
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Monthly Breakdown</h3>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="text-right">Collections</th>
                    <th class="text-right">Payments</th>
                    <th class="text-right">Net</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['monthly_breakdown'] as $month)
                    <tr>
                        <td>{{ $month['month'] }}</td>
                        <td class="text-right">${{ number_format($month['collections'], 2) }}</td>
                        <td class="text-right">${{ number_format($month['payments'], 2) }}</td>
                        <td class="text-right {{ $month['net'] > 0 ? 'text-danger' : 'text-success' }}">
                            ${{ number_format(abs($month['net']), 2) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
@endsection
