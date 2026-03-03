<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserProfile;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/profile')]
#[OA\Tag(name: 'Profile')]
final class ProfileController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Get(
        path: '/api/profile',
        summary: 'Recuperer le profil utilisateur',
        description: 'Retourne le profil de l utilisateur connecte. Repond 204 si aucun profil n existe.',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Profil retourne'),
            new OA\Response(response: 204, description: 'Aucun profil pour cet utilisateur'),
            new OA\Response(response: 401, description: 'Authentification requise'),
        ]
    )]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $profile = $user->getProfile();

        if (!$profile) {
            return $this->json(null, 204);
        }

        return $this->json($profile, 200, [], ['groups' => 'profile:read']);
    }

    #[Route('', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[OA\Patch(
        path: '/api/profile',
        summary: 'Mettre a jour le profil utilisateur',
        description: 'Cree ou met a jour le profil de l utilisateur connecte.',
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'firstName', type: 'string', example: 'Alice'),
                    new OA\Property(property: 'lastName', type: 'string', example: 'Martin'),
                    new OA\Property(property: 'birthDate', type: 'string', format: 'date', example: '1998-06-10'),
                    new OA\Property(property: 'phoneNumber', type: 'string', example: '+33102030405'),
                    new OA\Property(property: 'city', type: 'string', example: 'Paris'),
                    new OA\Property(property: 'country', type: 'string', example: 'France'),
                    new OA\Property(property: 'bio', type: 'string', example: 'Developpeuse backend Symfony'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profil mis a jour'),
            new OA\Response(response: 400, description: 'Payload invalide'),
            new OA\Response(response: 401, description: 'Authentification requise'),
        ]
    )]
    public function updateProfile(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $profile = $user->getProfile();

        if (!$profile) {
            $profile = new UserProfile();
            $profile->setUser($user);
            $user->setProfile($profile);
            $em->persist($profile);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (array_key_exists('firstName', $data)) $profile->setFirstName($data['firstName']);
        if (array_key_exists('lastName', $data)) $profile->setLastName($data['lastName']);
        if (array_key_exists('phoneNumber', $data)) $profile->setPhoneNumber($data['phoneNumber']);
        if (array_key_exists('city', $data)) $profile->setCity($data['city']);
        if (array_key_exists('country', $data)) $profile->setCountry($data['country']);
        if (array_key_exists('bio', $data)) $profile->setBio($data['bio']);

        if (array_key_exists('birthDate', $data)) {
            $profile->setBirthDate($data['birthDate'] ? new \DateTime($data['birthDate']) : null);
        }

        $em->flush();

        return $this->json($profile, 200, [], ['groups' => 'profile:read']);
    }
}
