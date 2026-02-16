<?php

namespace App\Service;

use App\Entity\Channel;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ChannelMemberManager
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
    ) {}

    public function addMemberByEmail(Channel $channel, string $email): User
    {
        $email = trim(mb_strtolower($email));
        if ($email === '') {
            throw new BadRequestHttpException('Email is required');
        }

        $user = $this->userRepository->findOneByEmail($email);
        if (!$user) {
            throw new NotFoundHttpException('User not found');
        }

        if (!$channel->getMembers()->contains($user)) {
            $channel->addMember($user);
            $this->em->flush();
        }

        return $user;
    }

    public function removeMember(Channel $channel, User $user): void
    {
        if ($channel->getMembers()->contains($user)) {
            $channel->removeMember($user);
            $this->em->flush();
        }
    }
}
