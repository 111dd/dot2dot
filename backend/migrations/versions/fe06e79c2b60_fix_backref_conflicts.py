from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fe06e79c2b60'
down_revision = '82d3913f9708'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('endpoints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('floor', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('building', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('network_color', sa.String(length=7), nullable=True))

        batch_op.alter_column('technician_name',
                              existing_type=sa.VARCHAR(length=100),
                              type_=sa.String(length=255),
                              existing_nullable=True)
        batch_op.alter_column('point_location',
                              existing_type=sa.VARCHAR(length=100),
                              type_=sa.String(length=255),
                              nullable=True)
        batch_op.alter_column('destination_room',
                              existing_type=sa.VARCHAR(length=100),
                              type_=sa.String(length=255),
                              nullable=True)
        batch_op.drop_column('ip_address')
        batch_op.drop_column('network')


def downgrade():
    with op.batch_alter_table('endpoints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('network', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('ip_address', sa.VARCHAR(length=15), autoincrement=False, nullable=True))
        batch_op.drop_column('network_color')
        batch_op.drop_column('building')
        batch_op.drop_column('floor')
