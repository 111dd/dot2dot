
"""Add model_id to routers

Revision ID: 647b4b8ed6fd
Revises: 1d42a9874f88
Create Date: 2024-12-26 14:01:28

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '647b4b8ed6fd'
down_revision = '1d42a9874f88'
branch_labels = None
depends_on = None


def upgrade():
    # הוספת העמודה עם אפשרות לערך NULL
    with op.batch_alter_table('routers') as batch_op:
        batch_op.add_column(sa.Column('model_id', sa.Integer(), nullable=True))

    # עדכון כל השורות עם ערך ברירת מחדל (לדוגמה: 1)
    op.execute('UPDATE routers SET model_id = (SELECT id FROM router_models LIMIT 1)')

    # שינוי העמודה כך שתהיה NOT NULL
    with op.batch_alter_table('routers') as batch_op:
        batch_op.alter_column('model_id', nullable=False)


def downgrade():
    # הסרת העמודה
    with op.batch_alter_table('routers') as batch_op:
        batch_op.drop_column('model_id')