<?php

namespace App\Tests\Repository;

use App\Repository\ChannelRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ChannelRepositoryTest extends KernelTestCase
{
    public function testRepositoryServiceIsAvailable(): void
    {
        self::bootKernel();
        $repo = self::getContainer()->get(ChannelRepository::class);

        $this->assertInstanceOf(ChannelRepository::class, $repo);
    }
}

