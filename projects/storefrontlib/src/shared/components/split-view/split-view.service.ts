import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { SplitViewState } from './split/split-view.model';

/**
 * Supposed to be injected in the split view component, so that the split view state
 * is maintained for a single split view.
 */
@Injectable()
export class SplitViewService {
  /**
   * Newly added views are hidden by default, unless it is the first view of the split view.
   * The default hide mode can be overridden.
   */
  defaultHideMode = true;

  protected _splitViewCount = 2;

  protected _views$: BehaviorSubject<any[]> = new BehaviorSubject([]);

  /**
   * Adds a view to the list of views. The view is initialized with the `SplitViewState`
   * state. If no state is provided, the state is created with the hidden property. The hidden
   * property is provided by the `defaultHideMode`, unless it's the first view (position: 0).
   */
  add(position: number, initialState?: SplitViewState) {
    const state: SplitViewState = {
      ...{ hidden: position === 0 ? false : this.defaultHideMode },
      ...initialState,
    };
    if (!this.views[position]) {
      this.views[position] = state;
      this.updateState(position, state.hidden);
      this._views$.next(this.views);
    }
  }

  /**
   * Returns an observable with the active view number. The active view number
   * represents the last visible view.
   */
  getActiveView(): Observable<number> {
    return this._views$.pipe(
      map((views) => this.getActive(views)),
      distinctUntilChanged()
    );
  }

  /**
   * Returns an observable with the SplitViewState for the given view position.
   */
  getViewState(position: number): Observable<SplitViewState> {
    return this._views$.pipe(
      map((views) => views[position]),
      // we must filter here, since outlet driven views will destroyed the view
      filter((view) => Boolean(view))
    );
  }

  /**
   * Removes a view from the list of views.
   *
   * Removing a view is different from hiding a view. Removing a view is typically done
   * when a component is destroyed.
   *
   * When the view is removed, the SplitViewState is updated to reflect that new organization
   * of views.
   */
  remove(position: number) {
    const activePosition = this.getActive(this.views);
    this._views$.next(this.views.splice(0, position));
    if (activePosition >= position) {
      this.updateState(position - 1);
    }
  }

  /**
   * Returns the next view position. This is useful for views that do not want to be bothered
   * with controlling view numbers.
   */
  get nextPosition(): number {
    return this.views.length || 0;
  }

  /**
   * Toggles the visibility of the views based on the given view position. If the view
   * is already visible, we close the view and active the former view. Unless the hide flag
   * is used, to force the view.
   *
   * The view state of other views in the split view are updated as well.
   *
   * @param position The zero-based position number of the view.
   * @param forceHide The (optional) hide state for the view position.
   */
  toggle(position: number, forceHide?: boolean) {
    // add the view if it hasn't been added before.
    if (!this.views[position]) {
      this.add(position, { hidden: forceHide ?? false });
    }

    // If the position is already visible, we move to a previous position. Only if the hide
    // state is forced, we keep the current position.
    if (
      this.views[position] &&
      forceHide === undefined &&
      !this.views[position].hidden
    ) {
      position--;
    }

    this.updateState(position, forceHide);
  }

  /**
   * Updates the hidden state of all the views.
   */
  protected updateState(position: number, hide?: boolean) {
    const views = [...this.views];
    if (views[position]) {
      views[position].hidden = hide;
    }
    const lastVisible =
      views.length - [...views].reverse().findIndex((view) => !view.hidden) - 1;

    views.forEach((view, pos) => {
      if (view) {
        view.hidden =
          pos > lastVisible || pos < lastVisible - (this._splitViewCount - 1);
      }
    });

    this._views$.next(views);
  }

  /**
   * Returns the active view count for the list of views.
   */
  protected getActive(views: SplitViewState[]): number {
    // we reverse the list to find the last visible view
    const l = [...views]
      .reverse()
      .findIndex((view: SplitViewState) => !view.hidden);
    const last = l === -1 ? 0 : views.length - l - 1;
    return last;
  }

  /**
   * Sets the view count for the split view.
   *
   * Defaults to 2.
   */
  set splitViewCount(count: number) {
    this._splitViewCount = count;
  }

  /**
   * Utility method that resolves all views from the subject.
   */
  protected get views(): SplitViewState[] {
    return this._views$.value;
  }
}
