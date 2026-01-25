<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Workspace;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class WorkspaceMemberManager
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
    ) {}


    public function addMemberByEmail(Workspace $workspace, string $email): array
    {
        $email = mb_strtolower(trim($email));

        $userToAdd = $this->userRepository->findOneBy(['email' => $email]);
        if (!$userToAdd instanceof User) {
            throw new NotFoundHttpException('User not found');
        }

        if ($workspace->getMembers()->contains($userToAdd)) {
            return [
                'status' => 'already_member',
                'userId' => $userToAdd->getId(),
            ];
        }

        $workspace->addMember($userToAdd);
        $this->em->flush();

        return [
            'status' => 'member_added',
            'userId' => $userToAdd->getId(),
        ];
    }


    public function removeMember(Workspace $workspace, int $userId): void
    {
        $userToRemove = $this->userRepository->find($userId);
        if (!$userToRemove instanceof User) {
            throw new NotFoundHttpException('User not found');
        }

        if ($workspace->getOwner() === $userToRemove) {
            throw new BadRequestHttpException('Cannot remove workspace owner');
        }

        if (!$workspace->getMembers()->contains($userToRemove)) {
            
            return;
        }

        $workspace->removeMember($userToRemove);
        $this->em->flush();
    }
}
