<?php

namespace App\Tests\Repository;

use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class MessageRepositoryTest extends KernelTestCase
{
    public function testRepositoryServiceIsAvailable(): void
    {
        self::bootKernel();
        $repo = self::getContainer()->get(MessageRepository::class);

        $this->assertInstanceOf(MessageRepository::class, $repo);
    }
}

