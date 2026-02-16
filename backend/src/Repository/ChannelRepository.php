<?php

namespace App\Repository;

use App\Entity\Channel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ChannelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Channel::class);
    }

    public function findOneInWorkspace(int $channelId, int $workspaceId): ?Channel
    {
        return $this->createQueryBuilder('c')
            ->innerJoin('c.workspace', 'w')
            ->andWhere('c.id = :channelId')
            ->andWhere('w.id = :workspaceId')
            ->setParameter('channelId', $channelId)
            ->setParameter('workspaceId', $workspaceId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    // OPTIONNEL: utile si tu veux aussi fetcher avec members preloaded plus tard
    public function findOneInWorkspaceWithMembers(int $channelId, int $workspaceId): ?Channel
    {
        return $this->createQueryBuilder('c')
            ->innerJoin('c.workspace', 'w')
            ->leftJoin('c.members', 'm')->addSelect('m')
            ->andWhere('c.id = :channelId')
            ->andWhere('w.id = :workspaceId')
            ->setParameter('channelId', $channelId)
            ->setParameter('workspaceId', $workspaceId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
