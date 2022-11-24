import { MigrationInterface, QueryRunner } from "typeorm";

export class CoreSchema1668767378851 implements MigrationInterface {
    name = 'CoreSchema1668767378851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "receipts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_user_id" uuid NOT NULL, "data" character varying NOT NULL, "capture_url" character varying, "status" character varying NOT NULL DEFAULT 'PENDING', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e8182d7c29e023da6e1ff33bfe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9a0a38840381ac158f12aeb9be" ON "receipts" ("data") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" character varying NOT NULL, "provider_type" character varying NOT NULL, "email" character varying NOT NULL, "display_name" character varying NOT NULL, "avatar_url" character varying NOT NULL, "pending_balance" numeric(45,0) NOT NULL DEFAULT '0', "available_balance" numeric(45,0) NOT NULL DEFAULT '0', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "receipts" ADD CONSTRAINT "FK_ad9c4935b887b867bb4ea29c3ec" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipts" DROP CONSTRAINT "FK_ad9c4935b887b867bb4ea29c3ec"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a0a38840381ac158f12aeb9be"`);
        await queryRunner.query(`DROP TABLE "receipts"`);
    }

}
