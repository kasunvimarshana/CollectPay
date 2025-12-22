<?php

namespace App\Events;

use App\Models\Collection;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CollectionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Collection $collection) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new Channel('collections');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => (string) $this->collection->id,
            'supplier_id' => (string) $this->collection->supplier_id,
            'product_id' => (string) $this->collection->product_id,
            'quantity' => (float) $this->collection->quantity,
            'unit' => $this->collection->unit,
            'collected_at' => $this->collection->collected_at->toISOString(),
            'created_at' => $this->collection->created_at?->toISOString(),
        ];
    }
}
