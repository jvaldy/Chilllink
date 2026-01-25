<?php

namespace App\Repository;

use App\Entity\Channel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Channel>
 */
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
}
