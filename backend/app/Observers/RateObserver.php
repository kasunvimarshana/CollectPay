<?php

namespace App\Observers;

use App\Models\Collection;
use App\Models\Rate;
use Illuminate\Support\Facades\DB;

class RateObserver
{
    /**
     * Handle the Rate "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Rate $rate): void
    {
        // Increment version on every update
        // The ?? 0 is a safety fallback - version should always exist (set to 1 by created event)
        // but if somehow it doesn't, we start from 0 and increment to 1
        if ($rate->isDirty() && ! $rate->isDirty('version')) {
            $rate->version = ($rate->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Rate "created" event.
     */
    public function created(Rate $rate): void
    {
        // Ensure version starts at 1
        if (! $rate->version) {
            $rate->version = 1;
            $rate->saveQuietly(); // Save without triggering events
        }
    }

    /**
     * Handle the Rate "updated" event.
     * When the rate value changes, recalculate applied rate and total amount for
     * all non-finalized collections that reference this rate.
     */
    public function updated(Rate $rate): void
    {
        if (! $rate->wasChanged('rate')) {
            return;
        }

        DB::transaction(function () use ($rate) {
            Collection::where('rate_id', $rate->id)
                ->where('is_finalized', false)
                ->each(function (Collection $collection) use ($rate) {
                    $collection->rate_applied = $rate->rate;
                    $collection->total_amount = (float) $collection->quantity * (float) $rate->rate;
                    $collection->version = ($collection->version ?? 0) + 1;
                    $collection->saveQuietly();
                });
        });
    }
}
