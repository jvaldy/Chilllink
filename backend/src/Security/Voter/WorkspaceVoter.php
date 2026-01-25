<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Workspace;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class WorkspaceVoter extends Voter
{
    public const VIEW = 'WORKSPACE_VIEW';   // membre
    public const OWNER = 'WORKSPACE_OWNER'; // owner

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Workspace
            && \in_array($attribute, [self::VIEW, self::OWNER], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Workspace $workspace */
        $workspace = $subject;

        return match ($attribute) {
            self::VIEW => $workspace->getMembers()->contains($user),
            self::OWNER => $workspace->getOwner() === $user,
            default => false,
        };
    }
}
