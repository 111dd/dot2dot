"""Update models

Revision ID: eb4acaf6af91
Revises: d7f2ca333a7a
Create Date: 2024-12-16 11:33:33.968800

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'eb4acaf6af91'
down_revision = 'd7f2ca333a7a'
branch_labels = None
depends_on = None


def upgrade():
    # עדכון עמודות בטבלת endpoints
    with op.batch_alter_table('endpoints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('rit_port_number', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('connected_port_number', sa.Integer(), nullable=True, server_default='0'))
        batch_op.drop_column('port_number')

    # עדכון רשומות קיימות ל-0
    op.execute("UPDATE endpoints SET rit_port_number = 0 WHERE rit_port_number IS NULL")
    op.execute("UPDATE endpoints SET connected_port_number = 0 WHERE connected_port_number IS NULL")

    # הפיכת העמודות ב-endpoints ל-NOT NULL לאחר עדכון
    with op.batch_alter_table('endpoints', schema=None) as batch_op:
        batch_op.alter_column('rit_port_number', nullable=False)
        batch_op.alter_column('connected_port_number', nullable=False)

    # logs
    with op.batch_alter_table('logs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('entity_id', sa.Integer(), nullable=False))

    # networks
    with op.batch_alter_table('networks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=100), nullable=True, server_default='temp_name'))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.drop_column('setup_date')
        batch_op.drop_column('dhcp_enabled')
        batch_op.drop_column('network_name')
        batch_op.drop_column('admin_name')
        batch_op.drop_column('is_active')

    # עדכון ערכים כפולים בעמודת name
    op.execute("""
        UPDATE networks
        SET name = CONCAT(name, '_', id)
        WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS row_number
                FROM networks
            ) AS subquery
            WHERE row_number > 1
        )
    """)

    # עדכון ערך זמני לשורות שעדיין יש להן temp_name
    op.execute("UPDATE networks SET name = CONCAT('Unknown_', id) WHERE name = 'temp_name'")

    # הפיכת העמודה name ל-NOT NULL והוספת מגבלת UNIQUE
    with op.batch_alter_table('networks', schema=None) as batch_op:
        batch_op.alter_column('name', nullable=False, server_default=None)
        batch_op.create_unique_constraint(None, ['name'])

    # routers
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.alter_column('building',
               existing_type=postgresql.ENUM('North', 'South', 'Pit', name='building_type'),
               type_=sa.String(length=50),
               existing_nullable=False)
        batch_op.alter_column('network_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.drop_constraint('routers_network_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'networks', ['network_id'], ['id'])
        batch_op.drop_column('network_type')

    # עדכון `network_id` ברשומות קיימות לערך ברירת מחדל (לדוגמה: 1)
    op.execute("UPDATE routers SET network_id = 1 WHERE network_id IS NULL")

    # הפיכת `network_id` ל-NOT NULL
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.alter_column('network_id', nullable=False)



def downgrade():
    # שחזור אחורה - השאר כמות שהוא (או שתתאים לפי הצורך)
    with op.batch_alter_table('routers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('network_type', sa.TEXT(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('routers_network_id_fkey', 'networks', ['network_id'], ['id'], ondelete='RESTRICT')
        batch_op.alter_column('network_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('building',
               existing_type=sa.String(length=50),
               type_=postgresql.ENUM('North', 'South', 'Pit', name='building_type'),
               existing_nullable=False)

    with op.batch_alter_table('networks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('admin_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('network_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('dhcp_enabled', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('setup_date', sa.DATE(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='unique')
        batch_op.drop_column('created_at')
        batch_op.drop_column('name')

    with op.batch_alter_table('logs', schema=None) as batch_op:
        batch_op.drop_column('entity_id')

    with op.batch_alter_table('endpoints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('port_number', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_column('connected_port_number')
        batch_op.drop_column('rit_port_number')
    # ### end Alembic commands ###
