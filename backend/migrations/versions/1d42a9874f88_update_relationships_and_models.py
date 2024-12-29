"""Update relationships and models with default model

Revision ID: 1d42a9874f88
Revises: f349246c4949
Create Date: 2024-12-26 12:12:17

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1d42a9874f88'
down_revision = 'f349246c4949'
branch_labels = None
depends_on = None

def upgrade():
    # שלב 1: הוספת עמודה עם אפשרות ל-NULL
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('model_id', sa.Integer(), nullable=True))

    # שלב 2: יצירת רשומת דגם ברירת מחדל (אם אין)
    op.execute("""
        INSERT INTO router_models (model_name)
        SELECT 'Default Model'
        WHERE NOT EXISTS (
            SELECT 1 FROM router_models WHERE model_name = 'Default Model'
        )
    """)

    # שלב 3: עדכון רשומות קיימות עם ערך ברירת מחדל
    op.execute("""
        UPDATE routers
        SET model_id = (SELECT id FROM router_models WHERE model_name = 'Default Model')
    """)

    # שלב 4: שינוי העמודה ל-`NOT NULL`
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.alter_column('model_id', nullable=False)

    # שלב 5: יצירת קשר עם מפתח זר
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.create_foreign_key(
            'fk_routers_model_id',
            'router_models',
            ['model_id'],
            ['id']
        )


def downgrade():
    # ביטול המיגרציה
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.drop_constraint('fk_routers_model_id', type_='foreignkey')
        batch_op.drop_column('model_id')
