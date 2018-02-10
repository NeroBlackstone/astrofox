import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Control, Option, Label } from 'components/controls/Control';
import {
    BoxInput,
    NumberInput,
    RangeInput,
    ButtonInput,
    ButtonGroup,
} from 'lib/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import iconLeft from 'svg/icons/chevron-left.svg';
import iconRight from 'svg/icons/chevron-right.svg';
import iconMinus from 'svg/icons/minus.svg';
import iconPlus from 'svg/icons/plus.svg';
import iconCircle from 'svg/icons/dots-three-horizontal.svg';
import styles from './ReactorControl.less';

const reactorBars = 64;

const outputModes = [
    { title: 'Backwards', icon: iconLeft },
    { title: 'Forward', icon: iconRight },
    { title: 'Cycle Backwards', icon: iconMinus },
    { title: 'Cycle Forward', icon: iconPlus },
    { title: 'Cycle', icon: iconCircle }
];

export default class ReactorControl extends PureComponent {
    static defaultProps = {
        barWidth: 8,
        barHeight: 100,
        barSpacing: 1,
        reactor: null,
        visible: false
    }

    componentDidMount() {
        const { barWidth, barHeight, barSpacing } = this.props;

        this.spectrum = new CanvasBars(
            {
                width: reactorBars * (barWidth + barSpacing),
                height: barHeight,
                barWidth: barWidth,
                barSpacing: barSpacing,
                shadowHeight: 0,
                color: '#775FD8',
                backgroundColor: '#FF0000'
            },
            this.spectrumCanvas
        );

        this.output = new CanvasMeter(
            {
                width: 20,
                height: barHeight,
                color: '#775FD8',
                origin: 'bottom'
            },
            this.outputCanvas
        );

        events.on('render', this.draw, this);
    }

    componentWillUnmount() {
        events.off('render', this.draw, this);
    }

    draw = () => {
        const { reactor } = this.props;

        if (reactor) {
            const { fft, output } = reactor.getResult();

            this.spectrum.render(fft);
            this.output.render(output);
        }
    }

    updateReactor = (name, value) => {
        let {reactor, barWidth, barHeight, barSpacing} = this.props,
            obj = { [name]: value };

        if (name === 'selection') {
            const {x, y, width, height} = value,
                maxWidth = reactorBars * (barWidth + barSpacing),
                maxHeight = barHeight;

            obj.range = {
                x1: x / maxWidth,
                x2: (x + width) / maxWidth,
                y1: y / maxHeight,
                y2: (y + height) / maxHeight
            };
        }

        reactor.update(obj);

        this.forceUpdate();
    }

    updateParser = (name, value) => {
        const { reactor } = this.props;

        if (reactor) {
            reactor.parser.update({ [name]: value });
            this.forceUpdate();
        }
    }

    render() {
        const { reactor, barWidth, barHeight, barSpacing, visible } = this.props;
        const { maxDecibels, smoothingTimeConstant } = (reactor ? reactor.parser.options : {});
        const { outputMode } = (reactor ? reactor.options : {});

        return (
            <div className={classNames({
                [styles.reactor]: true,
                [styles.hidden]: !visible
            })}>
                <div className={styles.title}>
                    {
                        reactor &&
                        reactor.options.displayName
                    }
                </div>
                <div className={styles.display}>
                    <div className={styles.controls}>
                        <Control className={styles.control}>
                            <Option className={styles.option}>
                                <Label text="Output Mode" className={styles.label} />
                                <ButtonGroup>
                                    {
                                        outputModes.map((mode, index) => (
                                            <ButtonInput
                                                key={index}
                                                icon={mode.icon}
                                                title={mode.title}
                                                active={outputMode === mode.title}
                                                onClick={() => this.updateReactor('outputMode', mode.title)}
                                            />
                                        ))
                                    }
                                </ButtonGroup>
                            </Option>
                            <Option className={styles.option}>
                                <Label text="Max dB" className={styles.label} />
                                <NumberInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    className={styles.input}
                                    width={40}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    onChange={this.updateParser}
                                />
                                <RangeInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    onChange={this.updateParser}
                                />
                            </Option>
                            <Option className={styles.option}>
                                <Label text="Smoothing" className={styles.label} />
                                <NumberInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    className={styles.input}
                                    width={40}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    onChange={this.updateParser}
                                />
                                <RangeInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    onChange={this.updateParser}
                                />
                            </Option>
                        </Control>
                    </div>
                    <div className={styles.spectrum}>
                        <canvas
                            ref={e => this.spectrumCanvas = e}
                            width={reactorBars * (barWidth + barSpacing)}
                            height={barHeight}
                            onClick={this.onClick}
                        />
                        <BoxInput
                            ref={e => this.box = e}
                            name="selection"
                            value={reactor ? reactor.options.selection : {}}
                            minWidth={barWidth}
                            minHeight={barWidth}
                            maxWidth={reactorBars * (barWidth + barSpacing)}
                            maxHeight={barHeight}
                            onChange={this.updateReactor}
                        />
                    </div>
                    <div className={styles.output}>
                        <canvas
                            ref={e => this.outputCanvas = e}
                            width={20}
                            height={barHeight}
                        />
                    </div>
                </div>
            </div>
        );
    }
}