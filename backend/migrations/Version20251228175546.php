<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251228175546 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE channel_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE message_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE workspace_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE channel (id INT NOT NULL, workspace_id INT NOT NULL, name VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_A2F98E4782D40A1F ON channel (workspace_id)');
        $this->addSql('COMMENT ON COLUMN channel.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE channel_user (channel_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(channel_id, user_id))');
        $this->addSql('CREATE INDEX IDX_11C7753772F5A1AA ON channel_user (channel_id)');
        $this->addSql('CREATE INDEX IDX_11C77537A76ED395 ON channel_user (user_id)');
        $this->addSql('CREATE TABLE message (id INT NOT NULL, author_id INT NOT NULL, channel_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON message (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F72F5A1AA ON message (channel_id)');
        $this->addSql('COMMENT ON COLUMN message.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE workspace (id INT NOT NULL, owner_id INT NOT NULL, name VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_8D9400197E3C61F9 ON workspace (owner_id)');
        $this->addSql('COMMENT ON COLUMN workspace.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE channel ADD CONSTRAINT FK_A2F98E4782D40A1F FOREIGN KEY (workspace_id) REFERENCES workspace (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE channel_user ADD CONSTRAINT FK_11C7753772F5A1AA FOREIGN KEY (channel_id) REFERENCES channel (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE channel_user ADD CONSTRAINT FK_11C77537A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F72F5A1AA FOREIGN KEY (channel_id) REFERENCES channel (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE workspace ADD CONSTRAINT FK_8D9400197E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE channel_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE message_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE workspace_id_seq CASCADE');
        $this->addSql('ALTER TABLE channel DROP CONSTRAINT FK_A2F98E4782D40A1F');
        $this->addSql('ALTER TABLE channel_user DROP CONSTRAINT FK_11C7753772F5A1AA');
        $this->addSql('ALTER TABLE channel_user DROP CONSTRAINT FK_11C77537A76ED395');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307FF675F31B');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F72F5A1AA');
        $this->addSql('ALTER TABLE workspace DROP CONSTRAINT FK_8D9400197E3C61F9');
        $this->addSql('DROP TABLE channel');
        $this->addSql('DROP TABLE channel_user');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE workspace');
    }
}
