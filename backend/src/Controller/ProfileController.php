<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/profile')]
final class ProfileController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
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