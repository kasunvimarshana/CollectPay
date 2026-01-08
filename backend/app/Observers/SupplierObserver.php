<?php

namespace App\Observers;

use App\Models\Supplier;

class SupplierObserver
{
    /**
     * Handle the Supplier "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Supplier $supplier): void
    {
        // Increment version on every update
        if ($supplier->isDirty() && ! $supplier->isDirty('version')) {
            $supplier->version = ($supplier->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Supplier "created" event.
     */
    public function created(Supplier $supplier): void
    {
        // Ensure version starts at 1
        if (! $supplier->version) {
            $supplier->version = 1;
            $supplier->saveQuietly(); // Save without triggering events
        }
    }
}
