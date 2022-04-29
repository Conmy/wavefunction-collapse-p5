const WfcStatus = {
    OPEN: 'open',
    COLLAPSED: 'collapsed',
};

const _sum = function(total, currentValue) {
    return total + currentValue;
};

class WfcCell {
    constructor (column, row) {
        // console.log('Creating cell at', column, row);
        this.column = column;
        this.row = row;
        this.status = WfcStatus.OPEN;
        this.enthropy = 0;
        this.tileOptions = [];
        this.chosenTileIndex = null;
    }

    setTileOptions(tileIndexes) {
        // console.log('populating tileOptions', tileIndexes);
        this.tileOptions = tileIndexes;
    }

    calculateEnthropy(tiles) {
        if (this.tileOptions.length == 0 || this.status === WfcStatus.COLLAPSED) {
            this.enthropy = 0;
            return;
        }

        const sum_w = this.tileOptions.reduce((total, value) => {
            return total + tiles[value].weight;
        }, 0);
        // console.log('sum of weights', sum_w);

        const wlogw = this.tileOptions.map(tileIndex => {
            const tileW = tiles[tileIndex].weight;
            return tileW * Math.log(tileW);
        });
        const sum_wlogw = wlogw.reduce(_sum, 0);

        this.enthropy = Math.log(sum_w) - (sum_wlogw / sum_w);
    }

    collapse() {
        // console.log('Attempting to collapse cell', this);
        if (this.status === WfcStatus.COLLAPSED) {
            console.error('Cell already collapsed', this);
            return;
        }
        if (this.tileOptions.length > 1) {
            const randIndex = Math.floor(Math.random() * this.tileOptions.length);
            this._collapseTo(this.tileOptions[randIndex]);
        } else if (this.tileOptions.length == 1) {
            this._collapseTo(this.tileOptions[0]);
        } else {
            console.error('Could not collapse to a tileOption', this);
        }
    }

    _collapseTo(tileIndex) {
        // console.log('Collapsing cell to a single tile', this, tileIndex);
        this.chosenTileIndex = tileIndex;
        this.status = WfcStatus.COLLAPSED;
        this.tileOptions = [];
        this.enthropy = 0;
    }
}