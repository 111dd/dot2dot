"""Add model column to routers and new tables

Revision ID: f349246c4949
Revises: f4a8ca2d0676
Create Date: 2024-12-26 11:21:49

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = 'f349246c4949'
down_revision = 'f4a8ca2d0676'
branch_labels = None
depends_on = None


def upgrade():
    # יצירת טבלה לדגמי נתבים
    op.create_table(
        'router_models',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('model_name', sa.String(length=100), unique=True, nullable=False)
    )

    # יצירת טבלה לסוויצ'ים
    op.create_table(
        'switches',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=100), unique=True, nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('ip_address', sa.String(length=15), unique=True, nullable=False),
        sa.Column('router_id', sa.Integer(), sa.ForeignKey('routers.id', ondelete="CASCADE"), nullable=False),
        sa.Column('connection_port', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=sa.func.now())
    )

    # הוספת עמודה "model" לנתבים
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('model', sa.String(length=100), nullable=True))  # תחילה nullable
        batch_op.create_unique_constraint('uq_router_name', ['name'])  # יצירת אינדקס ייחודי לשם הנתב

    # עדכון כל הנתבים עם דגם ברירת מחדל
    conn = op.get_bind()
    conn.execute(text("UPDATE routers SET model = 'Default Model' WHERE model IS NULL"))

    # עדכון העמודה "model" ל- NOT NULL
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.alter_column('model', nullable=False)


def downgrade():
    # הסרת העמודה "model" מנתבים
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.drop_constraint('uq_router_name', type_='unique')
        batch_op.drop_column('model')

    # מחיקת טבלת סוויצ'ים
    op.drop_table('switches')

    # מחיקת טבלת דגמי נתבים
    op.drop_table('router_models')
