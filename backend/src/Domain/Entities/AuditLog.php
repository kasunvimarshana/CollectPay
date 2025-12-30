<?php

declare(strict_types=1);

namespace Domain\Entities;

use DateTimeImmutable;

/**
 * AuditLog Entity
 * Immutable audit trail record
 */
final class AuditLog
{
    private int $id;
    private ?string $userId;
    private string $entityType;
    private string $entityId;
    private string $action;
    private ?array $oldValues;
    private ?array $newValues;
    private ?string $ipAddress;
    private ?string $userAgent;
    private DateTimeImmutable $createdAt;

    private function __construct(
        int $id,
        ?string $userId,
        string $entityType,
        string $entityId,
        string $action,
        ?array $oldValues,
        ?array $newValues,
        ?string $ipAddress,
        ?string $userAgent,
        DateTimeImmutable $createdAt
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->entityType = $entityType;
        $this->entityId = $entityId;
        $this->action = $action;
        $this->oldValues = $oldValues;
        $this->newValues = $newValues;
        $this->ipAddress = $ipAddress;
        $this->userAgent = $userAgent;
        $this->createdAt = $createdAt;
    }

    public static function create(
        ?string $userId,
        string $entityType,
        string $entityId,
        string $action,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return new self(
            0,
            $userId,
            $entityType,
            $entityId,
            $action,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent,
            new DateTimeImmutable()
        );
    }

    public static function reconstitute(
        int $id,
        ?string $userId,
        string $entityType,
        string $entityId,
        string $action,
        ?array $oldValues,
        ?array $newValues,
        ?string $ipAddress,
        ?string $userAgent,
        DateTimeImmutable $createdAt
    ): self {
        return new self(
            $id,
            $userId,
            $entityType,
            $entityId,
            $action,
            $oldValues,
            $newValues,
            $ipAddress,
            $userAgent,
            $createdAt
        );
    }

    // Getters
    public function getId(): int
    {
        return $this->id;
    }

    public function getUserId(): ?string
    {
        return $this->userId;
    }

    public function getEntityType(): string
    {
        return $this->entityType;
    }

    public function getEntityId(): string
    {
        return $this->entityId;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function getOldValues(): ?array
    {
        return $this->oldValues;
    }

    public function getNewValues(): ?array
    {
        return $this->newValues;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'entity_type' => $this->entityType,
            'entity_id' => $this->entityId,
            'action' => $this->action,
            'old_values' => $this->oldValues,
            'new_values' => $this->newValues,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
        ];
    }
}
