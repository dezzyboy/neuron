import { AppActions, StateDispatch } from 'states/stateProvider/reducer'
import {
  getWalletList,
  importMnemonic,
  getCurrentWallet,
  updateWallet,
  setCurrentWallet as setRemoteCurrentWallet,
  sendCapacity,
  getAddressesByWalletID,
  updateAddressDescription as updateRemoteAddressDescription,
  deleteWallet as deleteRemoteWallet,
  backupWallet as backupRemoteWallet,
} from 'services/remote'
import initStates from 'states/initStates'
import { wallets as walletsCache, currentWallet as currentWalletCache } from 'utils/localCache'
import { Routes } from 'utils/const'
import addressesToBalance from 'utils/addressesToBalance'
import { NeuronWalletActions } from '../reducer'
import { addNotification, addPopup } from './app'

export const updateCurrentWallet = () => (dispatch: StateDispatch) => {
  getCurrentWallet().then(res => {
    if (res.status) {
      const payload = res.result || initStates.wallet
      dispatch({
        type: NeuronWalletActions.UpdateCurrentWallet,
        payload,
      })
      currentWalletCache.save(payload)
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const createWalletWithMnemonic = (params: Controller.ImportMnemonicParams) => (
  dispatch: StateDispatch,
  history: any
) => {
  importMnemonic(params).then(res => {
    if (res.status) {
      history.push(Routes.Overview)
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const importWalletWithMnemonic = (params: Controller.ImportMnemonicParams) => (
  dispatch: StateDispatch,
  history: any
) => {
  importMnemonic(params).then(res => {
    if (res.status) {
      history.push(Routes.Overview)
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}
export const updateWalletList = () => (dispatch: StateDispatch) => {
  getWalletList().then(res => {
    if (res.status) {
      const payload = res.result || []
      dispatch({
        type: NeuronWalletActions.UpdateWalletList,
        payload,
      })
      walletsCache.save(payload)
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const updateWalletProperty = (params: Controller.UpdateWalletParams) => (
  dispatch: StateDispatch,
  history?: any
) => {
  updateWallet(params).then(res => {
    if (res.status) {
      addPopup('update-wallet-successfully')(dispatch)
      if (history) {
        history.push(Routes.SettingsWallets)
      }
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}
export const setCurrentWallet = (id: string) => (dispatch: StateDispatch) => {
  setRemoteCurrentWallet(id).then(res => {
    if (res.status) {
      dispatch({
        type: AppActions.Ignore,
        payload: null,
      })
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const sendTransaction = (params: Controller.SendTransaction) => (dispatch: StateDispatch, history: any) => {
  dispatch({
    type: AppActions.UpdateLoadings,
    payload: {
      sending: true,
    },
  })
  sendCapacity(params)
    .then(res => {
      if (res.status) {
        history.push(Routes.History)
      } else {
        addNotification({ type: 'alert', content: JSON.stringify(res.message.title) })(dispatch)
      }
      dispatch({
        type: AppActions.DismissPasswordRequest,
        payload: null,
      })
    })
    .finally(() => {
      dispatch({
        type: AppActions.UpdateLoadings,
        payload: {
          sending: false,
        },
      })
    })
}

export const updateAddressListAndBalance = (params: Controller.GetAddressesByWalletIDParams) => (
  dispatch: StateDispatch
) => {
  getAddressesByWalletID(params).then(res => {
    if (res.status) {
      const addresses = res.result || []
      const balance = addressesToBalance(addresses)
      dispatch({
        type: NeuronWalletActions.UpdateAddressListAndBalance,
        payload: { addresses, balance },
      })
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const updateAddressDescription = (params: Controller.UpdateAddressDescriptionParams) => (
  dispatch: StateDispatch
) => {
  dispatch({
    type: AppActions.UpdateLoadings,
    payload: {
      updateDescription: true,
    },
  })
  updateRemoteAddressDescription(params)
    .then(res => {
      if (res.status) {
        dispatch({
          type: AppActions.Ignore,
          payload: null,
        })
      } else {
        addNotification({ type: 'alert', content: res.message.title })(dispatch)
      }
    })
    .finally(() => {
      dispatch({
        type: AppActions.UpdateLoadings,
        payload: {
          updateDescription: false,
        },
      })
    })
}

export const deleteWallet = (params: Controller.DeleteWalletParams) => (dispatch: StateDispatch) => {
  dispatch({
    type: AppActions.DismissPasswordRequest,
    payload: null,
  })
  deleteRemoteWallet(params).then(res => {
    if (res.status) {
      addPopup('delete-wallet-successfully')(dispatch)
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}

export const backupWallet = (params: Controller.BackupWalletParams) => (dispatch: StateDispatch) => {
  dispatch({
    type: AppActions.DismissPasswordRequest,
    payload: null,
  })
  backupRemoteWallet(params).then(res => {
    if (res.status) {
      dispatch({
        type: AppActions.Ignore,
        payload: null,
      })
    } else {
      addNotification({ type: 'alert', content: res.message.title })(dispatch)
    }
  })
}
export default {
  createWalletWithMnemonic,
  importWalletWithMnemonic,
  updateCurrentWallet,
  updateWalletList,
  updateWallet,
  setCurrentWallet,
  sendTransaction,
  updateAddressListAndBalance,
  updateAddressDescription,
  deleteWallet,
  backupWallet,
}
