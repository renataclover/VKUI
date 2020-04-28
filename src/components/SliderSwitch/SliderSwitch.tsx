import React, { HTMLAttributes, KeyboardEvent } from 'react';
import SliderSwitchButton from './SliderSwitchButton';
import classNames from '../../lib/classNames';
import { HasFormLabels, HasPlatform } from '../../types';

interface Option {
  name: string;
  value: string | number;
  selected?: boolean;
}

interface Props extends HTMLAttributes<HTMLDivElement>, HasPlatform, HasFormLabels {
  options: Option[];
  name?: string;
  activeValue?: Option['value'];
  onSwitch?: (value: Option['value']) => void;
}

interface State {
  firstActive: boolean;
  secondActive: boolean;
  focusedByTab: boolean;
  focusedOptionId: number;
}

export default class SliderSwitch extends React.Component<Props, State> {
  state: State = {
    firstActive: Boolean(this.props.options[0].selected),
    secondActive: Boolean(this.props.options[1].selected),
    focusedByTab: false,
    focusedOptionId: -1,
  };

  private node: Element;

  handleFirstClick = () => {
    const { options, onSwitch } = this.props;
    const { value } = options[0];

    onSwitch && onSwitch(value);

    this.setState(() =>({
      firstActive: true,
      secondActive: false,
    }));
  };

  handleSecondClick = () => {
    const { options, onSwitch } = this.props;
    const { value } = options[1];

    onSwitch && onSwitch(value);

    this.setState(() =>({
      firstActive: false,
      secondActive: true,
    }));
  };

  handleFirstHover = () => {
    this.setState(() =>({
      focusedOptionId: 0,
    }));
  };

  handleSecondHover = () => {
    this.setState(() =>({
      focusedOptionId: 1,
    }));
  };

  resetFocusedOption = () => {
    this.setState(() => ({
      focusedOptionId: -1,
    }));
  };

  switchByKey = (event: KeyboardEvent) => {
    debugger;
    if (event.key !== 'Enter' && event.key !== 'Spacebar') {
      return;
    }

    const { onSwitch, options } = this.props;

    event.preventDefault();

    this.setState(({ firstActive, secondActive }) => {
      if (!firstActive && !secondActive) {
        return {
          firstActive: true,
          secondActive: false,
        };
      }

      return {
        firstActive: !firstActive,
        secondActive: !secondActive,
      };
    }, () => {
      const selected = Object.values(this.state)
        .findIndex((item) => typeof item === 'boolean' && item);

      onSwitch && onSwitch(options[selected].value);
    });
  };

  toggleFocus = () => {
    this.setState(({ focusedByTab }) =>({
      focusedByTab: !focusedByTab,
    }));
  };

  handleDocumentClick = (event: Event) => {
    const thisNode = this.node;

    if (this.state.focusedByTab && thisNode && !thisNode.contains(event.target as Node)) {
      this.setState({
        focusedByTab: false
      });
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, false);
  }

  static getDerivedStateFromProps(nextProps: Props) {
    if (nextProps.activeValue) {
      return {
        firstActive: nextProps.options[0].value === nextProps.activeValue,
        secondActive: nextProps.options[1].value === nextProps.activeValue,
      };
    }

    return null;
  }

  public render() {
    const { name, options, className, tabIndex = 0 } = this.props;
    const { firstActive, secondActive, focusedOptionId, focusedByTab } = this.state;
    const [firstOption, secondOption] = options;
    let value = null;

    if (firstActive) {
      value = firstOption.value;
    } else if (secondActive) {
      value = secondOption.value;
    }

    return (
      <div
        tabIndex={tabIndex}
        className={classNames('SliderSwitch__container', {
          'SliderSwitch__container--focus': focusedByTab,
        },
        className,
        )}
        onFocus={this.toggleFocus}
        onBlur={this.toggleFocus}
        onKeyDown={this.switchByKey}
        onMouseLeave={this.resetFocusedOption}
        ref={(node) => this.node = node}
      >
        {!firstActive && !secondActive &&
          <div className="SliderSwitch__border" />
        }
        <div className={classNames(
          'SliderSwitch__slider',
          {
            ['SliderSwitch--firstActive']: firstActive,
            ['SliderSwitch--secondActive']: secondActive,
          },
        )} />
        <input type="hidden" name={name} value={value} />
        <SliderSwitchButton
          active={firstActive}
          hovered={focusedOptionId === 0}
          aria-pressed={firstActive}
          onClick={this.handleFirstClick}
          onMouseEnter={this.handleFirstHover}
        >
          {firstOption.name}
        </SliderSwitchButton>
        <SliderSwitchButton
          active={secondActive}
          hovered={focusedOptionId === 1}
          onClick={this.handleSecondClick}
          onMouseEnter={this.handleSecondHover}
        >
          {secondOption.name}
        </SliderSwitchButton>
      </div>
    );
  }
}
