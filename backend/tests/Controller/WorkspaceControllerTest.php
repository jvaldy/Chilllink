<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Entity\Workspace;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

// Tests historiques du controller Workspace.
// Ils couvrent les cas de base (creation + listing) sans helpers partages.
class WorkspaceControllerTest extends WebTestCase
{
    // Helper local pour creer un utilisateur persiste.
    private function createUser(EntityManagerInterface $em, string $email): User
    {
        // Les emails sont fixes ici pour garder une lecture simple du scenario.
        // La base est recreatee au demarrage de la suite, donc pas de collision entre runs.
        $user = new User();
        $user->setEmail($email);
        $user->setPassword(password_hash('password', PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();

        return $user;
    }

    // Creation d'un workspace par un utilisateur connecte.
    public function testCreateWorkspace(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $user = $this->createUser($em, 'owner@example.com');
        $client->loginUser($user);

        $client->request('POST', '/api/workspaces', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'name' => 'Test Workspace'
        ]));
        $this->assertResponseStatusCodeSame(201);
    }

    // Un membre peut recuperer la liste de ses workspaces.
    public function testListWorkspaces(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $user = $this->createUser($em, 'member@example.com');

        // Preparation manuelle du workspace lie a l'utilisateur pour le test de listing.
        $workspace = new Workspace();
        $workspace->setName('Workspace List');
        $workspace->setOwner($user);
        $workspace->addMember($user);

        $em->persist($workspace);
        $em->flush();
        $client->loginUser($user);

        $client->request('GET', '/api/workspaces');
        $this->assertResponseIsSuccessful();
    }
}

