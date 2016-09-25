'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const Window = require('../../core/Window');

const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const DualRangeInput = require('../inputs/DualRangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const { Settings, Group, Row } = require('../components/Settings.jsx');

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

class VideoSettings extends UIComponent {
    constructor(props) {
        super(props);

        this.state = Object.assign(
            { isRunning: false },
            VideoSettings.defaultProps,
            props
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

        if (name === 'timeRange') {
            obj.timeStart = val.start;
            obj.timeEnd = val.end;
        }

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    onStart() {
        if (this.state.isRunning) return;

        Window.showSaveDialog(
            filename => {
                if (filename) {
                    this.setState({ isRunning: true }, () => {
                        Application.saveVideo(filename, this.state, () => {
                            this.setState({ isRunning: false });
                        });
                    });
                }
            },
            { defaultPath: 'video.mp4' }
        );
    }

    onOpenVideoFile() {
        Window.showSaveDialog(
            filename => {
                this.setState({ videoFile: filename });
            }
        );
    }

    onOpenAudioFile() {
        Window.showOpenDialog(
            files => {
                Application.loadAudioFile(files[0]).then(() => {
                    this.setState({ audioFile: files[0] });
                });
            }
        );
    }

    render() {
        const state = this.state,
            sound = Application.player.getSound('audio'),
            max = (sound) ? sound.getDuration() : 0,
            canStart = (state.videoFile.length && state.audioFile.length),
            onStart = canStart ? this.onStart: null;

        const buttonClass = {
            button: true,
            disabled: !canStart
        };

        return (
            <div id="video-settings" className="settings-panel">
                <Settings>
                    <Row label="Video File">
                        <TextInput
                            name="videoFile"
                            width={140}
                            value={state.videoFile}
                            onChange={this.onChange}
                        />
                        <span className="input-button icon-folder-open-empty" onClick={this.onOpenVideoFile} />
                    </Row>
                    <Row label="Audio File">
                        <TextInput
                            name="audioFile"
                            width={140}
                            value={state.audioFile}
                            onChange={this.onChange}
                        />
                        <span className="input-button icon-folder-open-empty" onClick={this.onOpenAudioFile} />
                    </Row>
                    <Row label="Video Format">
                        <SelectInput
                            name="videoFormat"
                            width={140}
                            items={videoFormats}
                            value={state.videoFormat}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Video Resolution">
                        <SelectInput
                            name="resolution"
                            width={140}
                            items={resolutionOptions}
                            value={state.resolution}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="FPS">
                        <SelectInput
                            name="fps"
                            width={140}
                            items={fpsOptions}
                            value={state.fps}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Time Range">
                        <NumberInput
                            name="timeStart"
                            width={40}
                            min={0}
                            max={max}
                            step={0.01}
                            value={state.timeStart}
                            onChange={this.onChange}
                        />
                        <div className="input flex">
                            <DualRangeInput
                                name="timeRange"
                                min={0}
                                max={max}
                                step={0.01}
                                start={this.state.timeStart}
                                end={this.state.timeEnd}
                                minRange={1}
                                onChange={this.onChange}
                            />
                        </div>
                        <NumberInput
                            name="timeEnd"
                            width={40}
                            min={0}
                            max={max}
                            step={0.01}
                            value={state.timeEnd}
                            onChange={this.onChange}
                        />
                    </Row>
                </Settings>
                <div className="buttons">
                    <div className={classNames(buttonClass)} onClick={onStart}>Start</div>
                    <div className="button" onClick={this.onCancel}>Cancel</div>
                </div>
            </div>
        );
    }
}

VideoSettings.defaultProps = {
    videoFile: '',
    audioFile: '',
    videoFormat: 'mp4',
    resolution: 480,
    fps: 29.97,
    timeStart: 0,
    timeEnd: 0
};

module.exports = VideoSettings;