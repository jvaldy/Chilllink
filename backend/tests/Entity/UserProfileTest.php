<?php

namespace App\Tests\Entity;

use App\Entity\User;
use App\Entity\UserProfile;
use PHPUnit\Framework\TestCase;

class UserProfileTest extends TestCase
{
    public function testSettersAndLifecycleCallbacks(): void
    {
        $user = (new User())->setEmail('profile@example.com');
        $birthDate = new \DateTimeImmutable('2000-01-01');

        $profile = (new UserProfile())
            ->setUser($user)
            ->setFirstName('Jane')
            ->setLastName('Doe')
            ->setBirthDate($birthDate)
            ->setPhoneNumber('0102030405')
            ->setCity('Paris')
            ->setCountry('France')
            ->setBio('Bio');

        $profile->onCreate();
        usleep(1000);
        $profile->onUpdate();

        $createdAt = $this->readDate($profile, 'createdAt');
        $updatedAt = $this->readDate($profile, 'updatedAt');

        $this->assertSame($user, $profile->getUser());
        $this->assertSame('Jane', $profile->getFirstName());
        $this->assertSame('Doe', $profile->getLastName());
        $this->assertSame($birthDate, $profile->getBirthDate());
        $this->assertSame('0102030405', $profile->getPhoneNumber());
        $this->assertSame('Paris', $profile->getCity());
        $this->assertSame('France', $profile->getCountry());
        $this->assertSame('Bio', $profile->getBio());
        $this->assertInstanceOf(\DateTimeImmutable::class, $createdAt);
        $this->assertInstanceOf(\DateTimeImmutable::class, $updatedAt);
        $this->assertGreaterThanOrEqual($createdAt, $updatedAt);
    }

    private function readDate(UserProfile $profile, string $field): \DateTimeImmutable
    {
        $reflection = new \ReflectionObject($profile);
        $property = $reflection->getProperty($field);

        return $property->getValue($profile);
    }
}

