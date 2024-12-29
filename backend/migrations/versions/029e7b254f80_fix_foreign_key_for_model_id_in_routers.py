from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '029e7b254f80'
down_revision = '2456f0943a24'
branch_labels = None
depends_on = None


def upgrade():
    # 1. הוספת העמודה model_id עם nullable=True
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('model_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_router_model', 'router_models', ['model_id'], ['id'])

    # 2. עדכון רשומות קיימות כך שיקבלו ערך ב-model_id
    # ברירת מחדל: שימוש בדגם הראשון שקיים בטבלת router_models
    op.execute("""
        UPDATE routers
        SET model_id = (
            SELECT id FROM router_models LIMIT 1
        )
        WHERE model_id IS NULL
    """)

    # 3. שינוי העמודה ל-`NOT NULL`
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.alter_column('model_id', nullable=False)

    # 4. הסרת העמודה הישנה 'model'
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.drop_column('model')


def downgrade():
    # 1. הוספת העמודה הישנה 'model'
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('model', sa.String(length=100), nullable=True))

    # 2. מחיקת העמודה 'model_id'
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.drop_constraint('fk_router_model', type_='foreignkey')
        batch_op.drop_column('model_id')
