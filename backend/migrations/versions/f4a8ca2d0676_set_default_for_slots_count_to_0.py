
"""Set default for slots_count to 0

Revision ID: f4a8ca2d0676
Revises: set_default_color
Create Date: 2024-12-22 12:53:38

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f4a8ca2d0676'
down_revision = 'set_default_color'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass

