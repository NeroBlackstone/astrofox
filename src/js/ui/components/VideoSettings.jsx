'use strict';

const React = require('react');

const Application = require('../../core/Application.js');
const Window = require('../../core/Window.js');
const autoBind = require('../../util/autoBind.js');

const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');

const videoFormats = [
    'mp4',
    'webm'
];

const resolutionOptions = [
    480,
    720,
    1080
];

const fpsOptions = [
    29.97,
    60
];

class VideoSettings extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Object.assign(
            { isRunning: false },
            VideoSettings.defaultProps
        );
    }

    componentDidMount() {
        let player = Application.player,
            sound = player.getSound('audio');

        player.stop();

        if (sound) {
            this.setState({ timeEnd: sound.getDuration() });
        }
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    onStart() {
        if (this.state.isRunning) return;

        Window.showSaveDialog(
            'video.mp4',
            filename => {
                if (filename) {
                    this.setState({ isRunning: true }, () => {
                        Application.saveVideo(filename, this.state, () => {
                            this.setState({ isRunning: false });
                        });
                    });
                }
            }
        );
    }

    renderVideo(filename, callback) {
        let player = Application.player,
            sound = player.getSound('audio'),
            renderer = new VideoRenderer(filename, Application.audioFile, {
                fps: 29.97,
                frames: 29.97 * 5
            });

        if (sound) {
            this.stopRender();

            player.stop('audio');

            this.spectrum.enabled = true;

            renderer.renderVideo(
                this.renderFrame.bind(this),
                this.startRender.bind(this)
            );
        }
        else {
            Events.emit('error', new Error('No audio loaded.'));
        }

        Logger.log('Video saved. (%s)', filename);
    }

    render() {
        const state = this.state,
            sound = Application.player.getSound('audio'),
            max = (sound) ? sound.getDuration() : 0;

        const style = {
            width: this.props.width,
            height: this.props.height
        };

        return (
            <div className="settings-panel" style={style}>
                <div className="view">
                    <div className="row">
                        <span className="label">Video Format</span>
                        <SelectInput
                            name="videoFormat"
                            size="20"
                            items={videoFormats}
                            value={state.videoFormat}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className="row">
                        <span className="label">Video Resolution</span>
                        <SelectInput
                            name="resolution"
                            size="20"
                            items={resolutionOptions}
                            value={state.resolution}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className="row">
                        <span className="label">FPS</span>
                        <SelectInput
                            name="fps"
                            size="20"
                            items={fpsOptions}
                            value={state.fps}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className="row">
                        <span className="label">Start Time</span>
                        <NumberInput
                            name="timeStart"
                            size="10"
                            min={0}
                            max={max}
                            value={state.timeStart}
                            onChange={this.onChange}
                        />
                        <div className="input flex">
                            <RangeInput
                                name="timeStart"
                                min={0}
                                max={max}
                                step={0.1}
                                lowerLimit={0}
                                upperLimit={state.timeEnd}
                                value={this.state.timeStart}
                                onChange={this.onChange} />
                        </div>
                    </div>
                    <div className="row">
                        <span className="label">End Time</span>
                        <NumberInput
                            name="timeEnd"
                            size="10"
                            min={0}
                            max={max}
                            value={state.timeEnd}
                            onChange={this.onChange}
                        />
                        <div className="input flex">
                            <RangeInput
                                name="timeEnd"
                                min={0}
                                max={max}
                                step={0.1}
                                lowerLimit={state.timeStart}
                                upperLimit={max}
                                value={this.state.timeEnd}
                                onChange={this.onChange} />
                        </div>
                    </div>
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.onStart}>Start</div>
                    <div className="button" onClick={this.onCancel}>Cancel</div>
                </div>
            </div>
        );
    }
}

VideoSettings.defaultProps = {
    width: 632,
    height: 'auto',
    videoFormat: 'mp4',
    resolution: 480,
    fps: 29.97,
    timeStart: 0,
    timeEnd: 0
};

module.exports = VideoSettings;