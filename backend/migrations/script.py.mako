<%
    import datetime
    now = datetime.datetime.now()
%>
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision or None}
Create Date: ${now.strftime("%Y-%m-%d %H:%M:%S")}

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '${up_revision}'
down_revision = ${repr(down_revision) or None}
branch_labels = ${repr(branch_labels) or None}
depends_on = ${repr(depends_on) or None}


def upgrade():
    ${upgrades if upgrades else "pass"}


def downgrade():
    ${downgrades if downgrades else "pass"}

