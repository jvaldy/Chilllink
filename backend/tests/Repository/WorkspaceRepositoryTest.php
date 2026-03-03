<?php

namespace App\Tests\Repository;

use App\Repository\WorkspaceRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class WorkspaceRepositoryTest extends KernelTestCase
{
    public function testRepositoryServiceIsAvailable(): void
    {
        self::bootKernel();
        $repo = self::getContainer()->get(WorkspaceRepository::class);

        $this->assertInstanceOf(WorkspaceRepository::class, $repo);
    }
}

