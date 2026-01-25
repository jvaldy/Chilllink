<?php

namespace App\Security\Voter;

use App\Entity\Channel;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class ChannelVoter extends Voter
{
    public const VIEW = 'CHANNEL_VIEW';
    public const POST_MESSAGE = 'CHANNEL_POST_MESSAGE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Channel
            && in_array($attribute, [self::VIEW, self::POST_MESSAGE], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Channel $channel */
        $channel = $subject;

        if (!$channel->getWorkspace()->isMember($user)) {
            return false;
        }

        return match ($attribute) {
            self::VIEW => $channel->isMember($user),
            self::POST_MESSAGE => $channel->isMember($user),
            default => false,
        };
    }
}
