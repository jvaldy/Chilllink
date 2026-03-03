<?php

namespace App\Tests\Repository;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

class UserRepositoryTest extends KernelTestCase
{
    public function testFindOneByEmailReturnsPersistedUser(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get(EntityManagerInterface::class);
        $repo = $container->get(UserRepository::class);

        $email = sprintf('repo_user_%s@example.com', bin2hex(random_bytes(4)));
        $user = (new User())
            ->setEmail($email)
            ->setPassword(password_hash('password123', PASSWORD_BCRYPT))
            ->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();

        $found = $repo->findOneByEmail($email);
        $this->assertSame($user->getId(), $found?->getId());
    }

    public function testUpgradePasswordUpdatesHash(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get(EntityManagerInterface::class);
        $repo = $container->get(UserRepository::class);

        $email = sprintf('repo_pwd_%s@example.com', bin2hex(random_bytes(4)));
        $user = (new User())
            ->setEmail($email)
            ->setPassword(password_hash('password123', PASSWORD_BCRYPT))
            ->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();

        $repo->upgradePassword($user, 'new_hash_value');
        $em->refresh($user);

        $this->assertSame('new_hash_value', $user->getPassword());
    }

    public function testUpgradePasswordThrowsForUnsupportedUserType(): void
    {
        self::bootKernel();
        $repo = self::getContainer()->get(UserRepository::class);

        $unsupportedUser = new class() implements PasswordAuthenticatedUserInterface {
            public function getPassword(): ?string
            {
                return 'hash';
            }
        };

        $this->expectException(UnsupportedUserException::class);
        $repo->upgradePassword($unsupportedUser, 'new_hash_value');
    }
}
