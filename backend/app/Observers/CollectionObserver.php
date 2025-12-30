<?php

namespace App\Observers;

use App\Models\Collection;

class CollectionObserver
{
    /**
     * Handle the Collection "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Collection $collection): void
    {
        // Increment version on every update
        // The ?? 0 is a safety fallback - version should always exist (set to 1 by created event)
        // but if somehow it doesn't, we start from 0 and increment to 1
        if ($collection->isDirty() && !$collection->isDirty('version')) {
            $collection->version = ($collection->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Collection "created" event.
     */
    public function created(Collection $collection): void
    {
        // Ensure version starts at 1
        if (!$collection->version) {
            $collection->version = 1;
            $collection->saveQuietly(); // Save without triggering events
        }
    }
}
