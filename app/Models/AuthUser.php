<?php

namespace App\Models;

use Illuminate\Auth\GenericUser;

class AuthUser extends GenericUser
{
    public function __construct(array $attributes)
    {
        // Always ensure remember_token exists to prevent errors during logout
        $attributes['remember_token'] = $attributes['remember_token'] ?? null;
        parent::__construct($attributes);
    }

    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName(): string
    {
        return 'bioid';
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword(): string
    {
        return $this->attributes['password'] ?? '';
    }

    /**
     * Get the column name for the password.
     */
    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    /**
     * Get the token used for the "remember me" session.
     * Always returns null since we don't support remember-me.
     */
    public function getRememberToken(): ?string
    {
        return null;
    }

    /**
     * Set the token used for the "remember me" session.
     * No-op since we don't persist remember tokens.
     */
    public function setRememberToken($value): void
    {
        // Not supported — no DB-backed user
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName(): string
    {
        return '';
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return ($this->attributes['role'] ?? 'user') === $role;
    }

    /**
     * Check if the user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // Super admins have all permissions
        if ($this->hasRole('super_admin')) {
            return true;
        }

        $permissions = $this->attributes['permissions'] ?? [];
        return in_array($permission, $permissions, true);
    }
}
