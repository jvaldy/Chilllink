<?php

namespace App\Tests\Controller;

use Doctrine\ORM\EntityManagerInterface;

// Validation des droits d'acces au niveau workspace (membre vs owner).
class WorkspacePermissionsTest extends ApiWebTestCase
{
    // Un utilisateur hors workspace ne peut pas consulter le detail.
    public function testShowWorkspaceForbiddenForNonMember(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('workspace_owner'));
        $outsider = $this->createUser($em, $this->uniqueEmail('workspace_outsider'));
        $workspace = $this->createWorkspace($em, $owner, 'Private Workspace');

        // "outsider" n'est volontairement pas ajoute comme membre.
        $this->loginApiUser($client, $outsider);
        $client->request('GET', '/api/workspaces/' . $workspace->getId());
        $this->assertResponseStatusCodeSame(403);
    }

    // Un membre non-owner ne peut pas modifier le workspace.
    public function testUpdateWorkspaceForbiddenForNonOwner(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('workspace_owner2'));
        $member = $this->createUser($em, $this->uniqueEmail('workspace_member'));
        $workspace = $this->createWorkspace($em, $owner, 'Team');
        $workspace->addMember($member);
        $em->flush();

        // Le membre peut voir le workspace, mais pas le modifier.
        $this->loginApiUser($client, $member);
        $client->request('PATCH', '/api/workspaces/' . $workspace->getId(), [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'Renamed']));
        $this->assertResponseStatusCodeSame(403);
    }

    // L'owner peut modifier le nom du workspace.
    public function testOwnerCanUpdateWorkspaceName(): void
    {
        $client = static::createClient();
        $em = self::getContainer()->get(EntityManagerInterface::class);

        $owner = $this->createUser($em, $this->uniqueEmail('workspace_owner3'));
        $workspace = $this->createWorkspace($em, $owner, 'Before');

        // Cas nominal owner: la modification doit passer.
        $this->loginApiUser($client, $owner);
        $client->request('PATCH', '/api/workspaces/' . $workspace->getId(), [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'After']));
        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);
        $this->assertSame('After', $json['name'] ?? null);
    }
}

