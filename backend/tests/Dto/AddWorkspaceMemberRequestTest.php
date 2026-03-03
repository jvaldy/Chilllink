<?php

namespace App\Tests\Dto;

use App\Dto\AddWorkspaceMemberRequest;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddWorkspaceMemberRequestTest extends KernelTestCase
{
    public function testValidationRejectsBlankEmail(): void
    {
        $validator = $this->validator();
        $dto = new AddWorkspaceMemberRequest();
        $dto->email = '';

        $violations = $validator->validate($dto);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testValidationRejectsInvalidEmailFormat(): void
    {
        $validator = $this->validator();
        $dto = new AddWorkspaceMemberRequest();
        $dto->email = 'bad-format';

        $violations = $validator->validate($dto);
        $this->assertGreaterThan(0, $violations->count());
    }

    public function testValidationAcceptsValidEmail(): void
    {
        $validator = $this->validator();
        $dto = new AddWorkspaceMemberRequest();
        $dto->email = 'valid@example.com';

        $violations = $validator->validate($dto);
        $this->assertCount(0, $violations);
    }

    private function validator(): ValidatorInterface
    {
        self::bootKernel();

        return self::getContainer()->get(ValidatorInterface::class);
    }
}
