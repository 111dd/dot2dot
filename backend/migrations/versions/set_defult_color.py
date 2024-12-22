from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'set_default_color'
down_revision = 'fe3ad1b09f21'  # עדכן ל-ID של המיגרציה הקודמת
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('networks', schema=None) as batch_op:
        batch_op.alter_column(
            'color',
            existing_type=sa.String(length=7),
            nullable=False,
            server_default='#FFFFFF'
        )


def downgrade():
    with op.batch_alter_table('networks', schema=None) as batch_op:
        batch_op.alter_column(
            'color',
            existing_type=sa.String(length=7),
            nullable=False,
            server_default=None
        )
