<?php

namespace App\Security\Voter;

use App\Entity\Channel;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ChannelVoter extends Voter
{
    public const VIEW = 'CHANNEL_VIEW';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Channel && $attribute === self::VIEW;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Channel $channel */
        $channel = $subject;

        // ✅ condition "pro" : il faut être membre du workspace ET membre du channel
        if (!$channel->getWorkspace()->getMembers()->contains($user)) {
            return false;
        }

        return $channel->getMembers()->contains($user);
    }
}
