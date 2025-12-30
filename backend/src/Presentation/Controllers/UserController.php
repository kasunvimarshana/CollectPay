<?php

declare(strict_types=1);

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\UseCases\CreateUser;
use LedgerFlow\Domain\Repositories\UserRepositoryInterface;
use LedgerFlow\Domain\Entities\User;

/**
 * User Controller
 * 
 * Handles HTTP requests for user-related operations.
 * Follows Clean Architecture - thin controller delegating to use cases.
 */
class UserController extends BaseController
{
    private UserRepositoryInterface $userRepository;
    private CreateUser $createUser;

    public function __construct(UserRepositoryInterface $userRepository, CreateUser $createUser)
    {
        $this->userRepository = $userRepository;
        $this->createUser = $createUser;
    }

    /**
     * List all users
     */
    public function index(): void
    {
        try {
            $users = $this->userRepository->findAll();
            $this->sendSuccessResponse(
                array_map(fn(User $user) => $user->toArray(), $users)
            );
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Get a specific user by ID
     */
    public function show(string $id): void
    {
        try {
            $userId = $this->parseId($id);
            $user = $this->userRepository->findById($userId);

            if (!$user) {
                $this->sendNotFoundResponse('User not found');
                return;
            }

            $this->sendSuccessResponse($user->toArray());
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Create a new user
     */
    public function store(): void
    {
        try {
            $data = $this->getJsonInput();
            $user = $this->createUser->execute($data);
            $this->sendCreatedResponse($user->toArray(), 'User created successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Update an existing user
     */
    public function update(string $id): void
    {
        try {
            $userId = $this->parseId($id);
            $user = $this->userRepository->findById($userId);

            if (!$user) {
                $this->sendNotFoundResponse('User not found');
                return;
            }

            $data = $this->getJsonInput();

            // Update user properties using domain methods
            if (isset($data['name'])) {
                $user->updateName($data['name']);
            }
            if (isset($data['email'])) {
                if ($this->userRepository->emailExists($data['email'], $userId)) {
                    $this->sendValidationErrorResponse('Email already exists');
                    return;
                }
                $user->updateEmail($data['email']);
            }
            if (isset($data['role'])) {
                $user->updateRole($data['role']);
            }
            if (isset($data['is_active'])) {
                if ($data['is_active']) {
                    $user->activate();
                } else {
                    $user->deactivate();
                }
            }

            $this->userRepository->save($user);
            $this->sendSuccessResponse($user->toArray(), 'User updated successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Delete a user (soft delete)
     */
    public function delete(string $id): void
    {
        try {
            $userId = $this->parseId($id);
            
            if (!$this->userRepository->exists($userId)) {
                $this->sendNotFoundResponse('User not found');
                return;
            }

            $this->userRepository->delete($userId);
            $this->sendSuccessResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }
}
