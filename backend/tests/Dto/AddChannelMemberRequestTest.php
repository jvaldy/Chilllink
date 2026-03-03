<?php

namespace App\Tests\Dto;

use App\Dto\AddChannelMemberRequest;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddChannelMemberRequestTest extends KernelTestCase
{
    public function testFromArrayUsesEmailField(): void
    {
        $dto = AddChannelMemberRequest::fromArray(['email' => 'user@example.com']);
        $this->assertSame('user@example.com', $dto->email);
    }

    public function testFromArrayFallsBackToEmptyString(): void
    {
        $dto = AddChannelMemberRequest::fromArray([]);
        $this->assertSame('', $dto->email);
    }

    public function testValidationRejectsInvalidEmail(): void
    {
        $validator = $this->validator();
        $dto = new AddChannelMemberRequest('not-an-email');

        $violations = $validator->validate($dto);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testValidationAcceptsValidEmail(): void
    {
        $validator = $this->validator();
        $dto = new AddChannelMemberRequest('valid@example.com');

        $violations = $validator->validate($dto);
        $this->assertCount(0, $violations);
    }

    private function validator(): ValidatorInterface
    {
        self::bootKernel();

        return self::getContainer()->get(ValidatorInterface::class);
    }
}
