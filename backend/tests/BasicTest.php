<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class BasicTest extends KernelTestCase
{
    // Sanity check minimal: le kernel doit pouvoir demarrer en mode test.
    // Ce test sert de garde-fou rapide en cas de regression de configuration.
    public function testKernelBoots(): void
    {
        self::bootKernel();
        $this->assertNotNull(self::$kernel);
    }
}

