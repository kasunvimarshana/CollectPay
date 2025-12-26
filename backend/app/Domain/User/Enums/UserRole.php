<?php

namespace App\Domain\User\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case COLLECTOR = 'collector';

    public function getPermissions(): array
    {
        return match($this) {
            self::ADMIN => [
                // Full access to all resources
                'users.create', 'users.read', 'users.update', 'users.delete',
                'suppliers.create', 'suppliers.read', 'suppliers.update', 'suppliers.delete',
                'products.create', 'products.read', 'products.update', 'products.delete',
                'rates.create', 'rates.read', 'rates.update', 'rates.delete',
                'collections.create', 'collections.read', 'collections.update', 'collections.delete',
                'payments.create', 'payments.read', 'payments.update', 'payments.delete', 'payments.approve',
                'reports.view', 'reports.export',
                'sync.manage', 'settings.manage',
            ],
            self::MANAGER => [
                // Management access without user administration
                'suppliers.create', 'suppliers.read', 'suppliers.update',
                'products.create', 'products.read', 'products.update',
                'rates.create', 'rates.read', 'rates.update',
                'collections.create', 'collections.read', 'collections.update',
                'payments.create', 'payments.read', 'payments.update', 'payments.approve',
                'reports.view', 'reports.export',
            ],
            self::COLLECTOR => [
                // Limited to data collection and viewing
                'suppliers.read',
                'products.read',
                'rates.read',
                'collections.create', 'collections.read', 'collections.update',
                'payments.read',
            ],
        };
    }

    public function getLabel(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::MANAGER => 'Manager',
            self::COLLECTOR => 'Collector',
        };
    }
}
