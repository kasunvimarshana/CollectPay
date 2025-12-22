<?php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentRecorded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Payment $payment) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new Channel('payments');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => (string) $this->payment->id,
            'supplier_id' => (string) $this->payment->supplier_id,
            'amount' => (float) $this->payment->amount,
            'currency' => $this->payment->currency,
            'type' => $this->payment->type,
            'paid_at' => $this->payment->paid_at->toISOString(),
            'created_at' => $this->payment->created_at?->toISOString(),
        ];
    }
}
