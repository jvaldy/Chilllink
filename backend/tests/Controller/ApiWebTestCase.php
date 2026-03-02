<?php

namespace App\Tests\Controller;

use App\Entity\Channel;
use App\Entity\Message;
use App\Entity\User;
use App\Entity\Workspace;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

// Base commune pour les tests API:
// - helpers de fixtures
// - helpers d'authentification
// - helpers de lecture de reponse JSON
abstract class ApiWebTestCase extends WebTestCase
{
    // Conserve l'utilisateur authentifie sur le firewall API dans un test fonctionnel.
    // Utile uniquement sur les routes qui acceptent l'auth de session de test.
    protected function loginApiUser(KernelBrowser $client, User $user): void
    {
        $client->disableReboot();
        $client->loginUser($user, 'api');
    }

    // Genere un email unique pour eviter les collisions de contrainte en base.
    protected function uniqueEmail(string $prefix = 'user'): string
    {
        return sprintf('%s_%s@example.com', $prefix, bin2hex(random_bytes(6)));
    }

    // Recupere un vrai JWT via l'endpoint de login pour tester les routes stateless.
    // On passe par le meme mecanisme que le front pour rester proche du comportement reel.
    protected function issueJwt(KernelBrowser $client, User $user, string $password = 'password123'): string
    {
        $client->request('POST', '/api/login_check', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'email' => $user->getEmail(),
            'password' => $password,
        ]));

        $this->assertResponseIsSuccessful();
        $json = $this->responseJson($client);

        $token = $json['token'] ?? null;
        $this->assertIsString($token);

        return $token;
    }

    /**
     * @return array<string, string>
     */
    // Construit les en-tetes HTTP utilises par les routes securisees.
    // Le header Authorization est necessaire pour les firewalls JWT stateless.
    protected function authHeaders(string $jwt, bool $json = false): array
    {
        $headers = [
            'HTTP_AUTHORIZATION' => 'Bearer '.$jwt,
        ];

        if ($json) {
            $headers['CONTENT_TYPE'] = 'application/json';
        }

        return $headers;
    }

    // Cree un utilisateur persiste avec un mot de passe test.
    // Le mot de passe est hashé pour rester compatible avec le login_check.
    protected function createUser(
        EntityManagerInterface $em,
        ?string $email = null,
        array $roles = ['ROLE_USER']
    ): User {
        $user = new User();
        $user->setEmail($email ?? $this->uniqueEmail());
        $user->setPassword(password_hash('password123', PASSWORD_BCRYPT));
        $user->setRoles($roles);

        $em->persist($user);
        $em->flush();

        return $user;
    }

    // Cree un workspace avec son owner deja membre.
    // Ce contrat est requis par la logique metier des voters et des endpoints membres.
    protected function createWorkspace(
        EntityManagerInterface $em,
        User $owner,
        string $name = 'Workspace'
    ): Workspace {
        $workspace = new Workspace();
        $workspace->setName($name);
        $workspace->setOwner($owner);
        $workspace->addMember($owner);

        $em->persist($workspace);
        $em->flush();

        return $workspace;
    }

    /**
     * @param User[]|null $members
     */
    // Cree un channel dans un workspace avec une liste de membres initiale.
    // Par defaut, l'owner du workspace est membre du channel.
    protected function createChannel(
        EntityManagerInterface $em,
        Workspace $workspace,
        string $name = 'general',
        ?array $members = null
    ): Channel {
        $channel = new Channel();
        $channel->setName($name);
        $channel->setWorkspace($workspace);

        foreach ($members ?? [$workspace->getOwner()] as $member) {
            $channel->addMember($member);
        }

        $em->persist($channel);
        $em->flush();

        return $channel;
    }

    // Cree un message rattache a un auteur et un channel.
    // Les dates sont gerees via callbacks Doctrine sur l'entite Message.
    protected function createMessage(
        EntityManagerInterface $em,
        Channel $channel,
        User $author,
        string $content = 'hello'
    ): Message {
        $message = new Message();
        $message->setChannel($channel);
        $message->setAuthor($author);
        $message->setContent($content);

        $em->persist($message);
        $em->flush();

        return $message;
    }

    /**
     * @return array<string, mixed>
     */
    // Decode la reponse JSON du client de test.
    protected function responseJson(KernelBrowser $client): array
    {
        $content = $client->getResponse()->getContent();
        if (!is_string($content) || $content === '') {
            return [];
        }

        $decoded = json_decode($content, true);

        return is_array($decoded) ? $decoded : [];
    }
}
